/**
 * CareCircle Automated Test Suite
 * Validates Next.js API Routes, Clinical Decision Support, Adherence Decrements,
 * RFC 5545 iCalendar Exporter, Emergency SOS & Stand-Down, and Notification Dispatchers.
 */

import { spawn } from 'child_process';
import assert from 'assert';

const PORT = 3088;
const BASE_URL = `http://127.0.0.1:${PORT}`;

let serverProcess = null;

// ANSI formatting helpers
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const cyan = (s) => `\x1b[36m${s}\x1b[0m`;
const bold = (s) => `\x1b[1m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;

let testStats = {
  total: 0,
  passed: 0,
  failed: 0,
  suites: [],
};

async function runTest(name, fn) {
  testStats.total++;
  process.stdout.write(`  • ${name}... `);
  const start = Date.now();
  try {
    await fn();
    const duration = Date.now() - start;
    testStats.passed++;
    console.log(`${green('PASS')} (${duration}ms)`);
  } catch (err) {
    const duration = Date.now() - start;
    testStats.failed++;
    console.log(`${red('FAIL')} (${duration}ms)`);
    console.error(`    ${red(err.stack || err.message)}`);
  }
}

async function startServer() {
  console.log(cyan(`\n[1/3] Starting Next.js Production Server on port ${PORT}...`));
  serverProcess = spawn(process.execPath, ['./node_modules/next/dist/bin/next', 'start', '-p', String(PORT)], {
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: false,
    env: { ...process.env, PORT: String(PORT), NODE_ENV: 'production' },
  });

  serverProcess.stderr.on('data', (d) => {
    const msg = d.toString();
    if (!msg.includes('ExperimentalWarning')) {
      // console.error(`[Server stderr] ${msg}`);
    }
  });

  // Poll until server responds
  const maxAttempts = 30;
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 800));
    try {
      const res = await fetch(`${BASE_URL}/api/medications`);
      if (res.ok) {
        console.log(green(`✓ Next.js server ready at ${BASE_URL}\n`));
        return;
      }
    } catch {
      // wait and retry
    }
  }
  throw new Error(`Server failed to start within timeout on port ${PORT}`);
}

function stopServer() {
  if (serverProcess) {
    console.log(cyan('\n[3/3] Shutting down test server...'));
    serverProcess.kill('SIGTERM');
    try {
      process.kill(serverProcess.pid);
    } catch {}
  }
}

async function runTestSuite() {
  console.log(bold(cyan('[2/3] Executing CareCircle API & Clinical Test Suite...\n')));

  // ==========================================
  // SUITE 1: Medications & Drug Interactions
  // ==========================================
  console.log(bold('--- Suite 1: Medications API & Clinical Interaction Engine ---'));

  await runTest('GET /api/medications - returns seeded medications & interactions', async () => {
    const res = await fetch(`${BASE_URL}/api/medications`);
    assert.strictEqual(res.status, 200, 'HTTP status must be 200');
    const json = await res.json();
    assert.strictEqual(json.success, true, 'Response success must be true');
    assert.ok(Array.isArray(json.data), 'Data must be an array');
    assert.ok(json.data.length >= 3, 'Must have pre-seeded medications (Lisinopril, Metformin, etc.)');
    assert.ok(Array.isArray(json.interactions), 'Interactions must be returned');
    
    // Verify Telma / Lisinopril is present
    const bpMed = json.data.find(m => m.name.toLowerCase().includes('telma') || m.name.toLowerCase().includes('lisinopril'));
    assert.ok(bpMed, 'Hypertension BP medicine (Telma 40 / Lisinopril) should be pre-seeded');
  });

  let createdMedId = null;
  await runTest('POST /api/medications - adds medication and flags severe drug interaction', async () => {
    // Add "Potassium Chloride" which has a CRITICAL interaction with Lisinopril (int-3)
    const newMedPayload = {
      name: 'Potassium Chloride',
      brandName: 'K-Dur',
      dosage: '20 mEq',
      form: 'tablet',
      frequency: 'daily',
      purpose: 'Electrolyte replacement',
      prescribingDoctor: 'Dr. Michael Chen, MD',
      remainingCount: 30,
      totalRefillCount: 30,
      refillThreshold: 5,
      loggedBy: 'Nurse David Martinez, RN',
    };

    const res = await fetch(`${BASE_URL}/api/medications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMedPayload),
    });

    assert.strictEqual(res.status, 200, 'HTTP status must be 200');
    const json = await res.json();
    assert.strictEqual(json.success, true, 'POST must succeed');
    assert.ok(json.data.id, 'New medication must have an ID');
    createdMedId = json.data.id;
    assert.strictEqual(json.data.name, 'Potassium Chloride');

    // Clinical Drug Interaction verification:
    // Telmisartan / Lisinopril + Potassium Chloride = Critical Hyperkalemia Warning
    assert.ok(Array.isArray(json.interactions), 'Must return updated interactions');
    const criticalInteraction = json.interactions.find(i =>
      ((i.drugA.toLowerCase().includes('telmisartan') || i.drugA.toLowerCase().includes('lisinopril')) && i.drugB?.toLowerCase().includes('potassium')) ||
      (i.drugA.toLowerCase().includes('potassium') && (i.drugB?.toLowerCase().includes('telmisartan') || i.drugB?.toLowerCase().includes('lisinopril')))
    );
    assert.ok(criticalInteraction, 'Drug interaction engine MUST flag Telmisartan/Lisinopril + Potassium Chloride');
    assert.strictEqual(criticalInteraction.severity, 'critical', 'Interaction severity must be critical');
    assert.ok(criticalInteraction.elderExplanation.length > 10, 'Must include elder-friendly explanation');
    assert.ok(criticalInteraction.clinicalSummary.length > 10, 'Must include clinical explanation');
  });

  await runTest('PUT /api/medications - updates dosage and instructions', async () => {
    assert.ok(createdMedId, 'Requires createdMedId from previous step');
    const updatePayload = {
      id: createdMedId,
      dosage: '10 mEq (Reduced)',
      instructions: 'Take with full glass of water with food.',
    };

    const res = await fetch(`${BASE_URL}/api/medications`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatePayload),
    });

    assert.strictEqual(res.status, 200, 'HTTP status must be 200');
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.data.dosage, '10 mEq (Reduced)');
  });

  await runTest('DELETE /api/medications - deactivates/removes medication', async () => {
    assert.ok(createdMedId, 'Requires createdMedId');
    const res = await fetch(`${BASE_URL}/api/medications?id=${createdMedId}`, {
      method: 'DELETE',
    });

    assert.strictEqual(res.status, 200, 'HTTP status must be 200');
    const json = await res.json();
    assert.strictEqual(json.success, true);

    // Verify it is removed from active list
    const checkRes = await fetch(`${BASE_URL}/api/medications`);
    const checkJson = await checkRes.json();
    const found = checkJson.data.find(m => m.id === createdMedId);
    assert.strictEqual(found, undefined, 'Medication should no longer exist in store');
  });

  // ==========================================
  // SUITE 2: Adherence Logging, Pill Count & Refill Warning
  // ==========================================
  console.log(bold('\n--- Suite 2: Adherence Tracking & Automated Pill Inventory ---'));

  await runTest('GET /api/adherence - returns adherence scorecards & stats', async () => {
    const res = await fetch(`${BASE_URL}/api/adherence`);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.ok(Array.isArray(json.logs), 'Logs must be array');
    assert.ok(typeof json.stats.adherenceRate7d === 'number', '7d rate must be numeric');
    assert.ok(typeof json.stats.adherenceRate30d === 'number', '30d rate must be numeric');
    assert.ok(json.stats.currentStreakDays >= 0, 'Current streak must be tracked');
  });

  await runTest('POST /api/adherence - marks dose as taken, decrements count & creates log', async () => {
    // Fetch initial pill count for Lisinopril
    const medsRes = await fetch(`${BASE_URL}/api/medications`);
    const medsData = await medsRes.json();
    const lisinopril = medsData.data.find(m => m.name.toLowerCase().includes('lisinopril'));
    assert.ok(lisinopril, 'Lisinopril must exist');
    const initialCount = lisinopril.remainingCount;

    const payload = {
      medicationId: lisinopril.id,
      scheduledTime: '08:00',
      status: 'taken',
      loggedBy: { name: 'Eleanor Vance', role: 'elder' },
      notes: 'Morning dose taken with breakfast water',
      voiceConfirmed: true,
    };

    const res = await fetch(`${BASE_URL}/api/adherence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.ok(json.log, 'Adherence log object must be returned');
    assert.strictEqual(json.log.status, 'taken');
    assert.strictEqual(json.log.voiceConfirmed, true);
    assert.strictEqual(json.remainingCount, initialCount - 1, 'Pill count must decrement by 1');
  });

  await runTest('POST /api/adherence - triggers automated refill alert when count <= threshold', async () => {
    // First, create a low-count medication near refill threshold
    const lowMedRes = await fetch(`${BASE_URL}/api/medications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Hydrochlorothiazide',
        dosage: '12.5 mg',
        remainingCount: 5, // At threshold
        refillThreshold: 5,
      }),
    });
    const lowMedData = await lowMedRes.json();
    const medId = lowMedData.data.id;

    // Now take a dose, driving remaining count from 5 down to 4 (< threshold)
    const res = await fetch(`${BASE_URL}/api/adherence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        medicationId: medId,
        status: 'taken',
        loggedBy: { name: 'Eleanor Vance', role: 'elder' },
      }),
    });

    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.remainingCount, 4);

    // Verify notification log has captured the refill alert
    const notifRes = await fetch(`${BASE_URL}/api/notifications`);
    const notifData = await notifRes.json();
    const refillAlert = notifData.data.find(n =>
      n.type === 'refill_alert' && n.subject.includes('Hydrochlorothiazide')
    );
    assert.ok(refillAlert, 'Automatic refill alert email notification must be logged');
    assert.ok(['sent', 'delivered', 'simulated'].includes(refillAlert.status), 'Refill email status should be valid');
  });

  // ==========================================
  // SUITE 3: Appointments & RFC 5545 iCalendar Exporter
  // ==========================================
  console.log(bold('\n--- Suite 3: Appointments & RFC 5545 .ics Calendar Export ---'));

  let appointmentId = null;
  await runTest('POST /api/appointments - schedules new doctor appointment', async () => {
    const payload = {
      title: 'Cardiology Follow-up & ECG',
      doctorName: 'Dr. Michael Chen, MD',
      specialty: 'Cardiology',
      clinic: 'Springfield Heart & Wellness Institute',
      date: '2026-12-10',
      time: '10:30 AM',
      location: '1200 S MacArthur Blvd, Suite 300, Springfield, IL',
      notes: 'Review blood pressure log and medication adjustments.',
      transportationArranged: true,
      accompaniedBy: 'Sarah Vance-Miller (Daughter)',
    };

    const res = await fetch(`${BASE_URL}/api/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.ok(json.data.id, 'Appointment must have ID');
    appointmentId = json.data.id;
    assert.strictEqual(json.data.title, payload.title);
    assert.strictEqual(json.data.transportationArranged, true);
  });

  await runTest('GET /api/appointments?format=ics - generates standard RFC 5545 .ics export', async () => {
    assert.ok(appointmentId, 'Requires appointmentId');
    const res = await fetch(`${BASE_URL}/api/appointments?format=ics&id=${appointmentId}`);
    assert.strictEqual(res.status, 200);
    
    // Check Content-Type & Content-Disposition
    const contentType = res.headers.get('content-type');
    assert.ok(contentType?.includes('text/calendar'), `Content-Type must be text/calendar, got: ${contentType}`);
    const disposition = res.headers.get('content-disposition');
    assert.ok(disposition?.includes('.ics'), 'Content-Disposition must specify .ics filename');

    const icsText = await res.text();
    // Validate RFC 5545 specifications
    assert.ok(icsText.includes('BEGIN:VCALENDAR'), 'Must contain BEGIN:VCALENDAR');
    assert.ok(icsText.includes('VERSION:2.0'), 'Must specify VERSION:2.0');
    assert.ok(icsText.includes('PRODID:-//CareCircle//Healthcare Platform//EN'), 'Must have CareCircle PRODID');
    assert.ok(icsText.includes('BEGIN:VEVENT'), 'Must contain BEGIN:VEVENT');
    assert.ok(icsText.includes(`UID:carecircle-appt-${appointmentId}@carecircle.health`), 'Must contain valid UID');
    assert.ok(icsText.includes('SUMMARY:CareCircle: Cardiology Follow-up & ECG - Dr. Michael Chen, MD'), 'Must have correct SUMMARY');
    assert.ok(icsText.includes('LOCATION:1200 S MacArthur Blvd, Suite 300, Springfield, IL'), 'Must include LOCATION');
    assert.ok(icsText.includes('STATUS:CONFIRMED'), 'Must specify STATUS:CONFIRMED');
    assert.ok(icsText.includes('END:VEVENT'), 'Must contain END:VEVENT');
    assert.ok(icsText.includes('END:VCALENDAR'), 'Must contain END:VCALENDAR');
  });

  // ==========================================
  // SUITE 4: Emergency SOS Beacon & Stand-Down Resolution
  // ==========================================
  console.log(bold('\n--- Suite 4: Emergency SOS Beacon & Stand-Down Resolution ---'));

  await runTest('POST /api/emergency - triggers one-tap SOS beacon & broadcasts emergency notifications', async () => {
    const payload = {
      initiatedBy: 'Eleanor Vance (Elder Touchscreen)',
      room: 'Living Room (Beside Recliner)',
    };

    const res = await fetch(`${BASE_URL}/api/emergency`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.sos.status, 'active');
    assert.strictEqual(json.sos.initiatedBy, payload.initiatedBy);
    assert.ok(Array.isArray(json.sos.notifiedContacts), 'Contacts must be notified');
    assert.ok(json.sos.elderLocation.coordinates.lat, 'Latitude should be included');

    // Verify emergency broadcast emails were generated in notification archive
    const notifRes = await fetch(`${BASE_URL}/api/notifications`);
    const notifData = await notifRes.json();
    const emergencyEmails = notifData.data.filter(n =>
      n.type === 'sos_emergency' && n.subject.includes('CRITICAL: EMERGENCY SOS')
    );
    assert.ok(emergencyEmails.length >= 1, 'Emergency SOS email must be sent to circle members');
  });

  await runTest('GET /api/emergency - reports active SOS status and medical profile', async () => {
    const res = await fetch(`${BASE_URL}/api/emergency`);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.ok(json.activeSos, 'Should have activeSos present');
    assert.strictEqual(json.activeSos.status, 'active');
    assert.strictEqual(json.elder.name, 'Eleanor Vance');
    assert.strictEqual(json.elder.bloodType, 'O-Positive');
    assert.ok(json.elder.emergencyNotes.includes('lockbox'), 'Emergency notes with lockbox code must be included');
  });

  await runTest('PUT /api/emergency - executes stand-down and resolves emergency event', async () => {
    const payload = {
      resolvedBy: 'Sarah Vance-Miller (Daughter)',
      resolutionNotes: 'Arrived at residence. Eleanor is safe and resting comfortably. No EMS required.',
    };

    const res = await fetch(`${BASE_URL}/api/emergency`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.resolved.status, 'resolved');
    assert.strictEqual(json.resolved.resolvedBy, payload.resolvedBy);

    // Verify active SOS is cleared
    const checkRes = await fetch(`${BASE_URL}/api/emergency`);
    const checkJson = await checkRes.json();
    assert.strictEqual(checkJson.activeSos, null, 'Active SOS must be null after resolution');
  });

  // ==========================================
  // SUITE 5: Notifications & Email Dispatcher
  // ==========================================
  console.log(bold('\n--- Suite 5: Notifications & Live Email Dispatcher ---'));

  await runTest('POST /api/notifications - dispatches daily_schedule dose reminder email', async () => {
    const res = await fetch(`${BASE_URL}/api/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateType: 'daily_schedule',
        recipientEmail: 'sarah.vance@example.com',
        recipientName: 'Sarah Vance-Miller',
      }),
    });

    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.log.type, 'medication_reminder');
    assert.ok(json.log.htmlContent && (json.log.htmlContent.includes('Lisinopril') || json.log.htmlContent.includes('Morning')), 'Email HTML must render pill info');
  });

  await runTest('POST /api/notifications - dispatches missed_dose escalation alert email', async () => {
    const res = await fetch(`${BASE_URL}/api/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateType: 'missed_dose',
        recipientEmail: 'david.rn@sunshinehomehealth.org',
        recipientName: 'Nurse David Martinez',
      }),
    });

    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.log.type, 'missed_dose_alert');
    assert.ok(json.log.subject.includes('Dose Not Logged'), 'Subject must indicate missed dose');
  });

  await runTest('POST /api/notifications - dispatches refill warning alert email', async () => {
    const res = await fetch(`${BASE_URL}/api/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateType: 'refill',
        recipientEmail: 'sarah.vance@example.com',
      }),
    });

    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.log.type, 'refill_alert');
    assert.ok(json.log.subject.includes('Refill Needed'), 'Subject must indicate refill needed');
  });

  // ==========================================
  // SUITE 6: Elder Wellbeing Check-in & Vitals
  // ==========================================
  console.log(bold('\n--- Suite 6: Elder Wellbeing Check-in & Vitals ---'));

  await runTest('POST /api/wellbeing - records daily elder mood status and blood pressure reading', async () => {
    const payload = {
      mood: 'great',
      notes: 'Slept 8 hours and took morning walk in garden.',
      bpReading: '124/82',
    };

    const res = await fetch(`${BASE_URL}/api/wellbeing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);

    // Verify vitals list captured the BP reading
    const vitalsRes = await fetch(`${BASE_URL}/api/wellbeing`);
    const vitalsData = await vitalsRes.json();
    const bp = vitalsData.vitals.find(v => v.value === '124/82');
    assert.ok(bp, 'Vitals log must record blood pressure reading');
    assert.strictEqual(bp.status, 'normal');
  });

  await runTest('POST /api/wellbeing - triggers caregiver assistance alert when mood is "help"', async () => {
    const payload = {
      mood: 'help',
      notes: 'Feeling slightly dizzy when getting out of bed.',
    };

    const res = await fetch(`${BASE_URL}/api/wellbeing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);

    // Verify activity feed captured warning
    const notesRes = await fetch(`${BASE_URL}/api/notes`);
    const notesData = await notesRes.json();
    const helpActivity = notesData.data.find(a =>
      a.title?.includes('Needs Extra Help') || a.description?.includes('dizzy')
    );
    assert.ok(helpActivity, 'Activity feed must log elder help request');
  });

  // ==========================================
  // SUITE 7: Care Circle Collaborative Notes
  // ==========================================
  console.log(bold('\n--- Suite 7: Care Circle Collaborative Notes ---'));

  await runTest('POST /api/notes - posts nurse/family collaborative note to activity feed', async () => {
    const payload = {
      authorName: 'Nurse David Martinez, RN',
      role: 'nurse',
      text: 'Visited Eleanor at 2:00 PM. Vitals stable (BP 124/82). Filled weekly pill sorter. Eleanor is in great spirits.',
      category: 'clinical',
      severity: 'normal',
    };

    const res = await fetch(`${BASE_URL}/api/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.data.description, payload.text);
    assert.strictEqual(json.data.actor.name, payload.authorName);

    // Verify GET /api/notes contains it
    const feedRes = await fetch(`${BASE_URL}/api/notes`);
    const feedJson = await feedRes.json();
    const noteFound = feedJson.data.find(n => n.description === payload.text);
    assert.ok(noteFound, 'Note must appear in circle activity feed');
  });

  await runTest('POST /api/notes - rejects empty note text with 400 Bad Request', async () => {
    const res = await fetch(`${BASE_URL}/api/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorName: 'Sarah', text: '   ' }),
    });

    assert.strictEqual(res.status, 400, 'Empty note must return HTTP 400');
    const json = await res.json();
    assert.strictEqual(json.success, false);
  });
}

async function main() {
  const overallStart = Date.now();
  try {
    await startServer();
    await runTestSuite();
  } catch (err) {
    console.error(red(`\nTest suite fatal error: ${err.message}`));
    process.exitCode = 1;
  } finally {
    stopServer();
    const elapsed = ((Date.now() - overallStart) / 1000).toFixed(2);
    console.log(bold('\n========================================'));
    console.log(bold(`TEST RESULTS: ${testStats.passed}/${testStats.total} Passed in ${elapsed}s`));
    if (testStats.failed > 0) {
      console.log(red(`❌ ${testStats.failed} test(s) failed.`));
      process.exitCode = 1;
    } else {
      console.log(green(`✓ All ${testStats.passed} tests passed with 100% success rate!`));
    }
    console.log(bold('========================================\n'));
    process.exit(process.exitCode || 0);
  }
}

main();
