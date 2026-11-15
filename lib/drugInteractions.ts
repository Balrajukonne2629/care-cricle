import { DrugInteraction, Medication } from './types';

// Clinical database of high-risk drug-drug and drug-food interactions
export const CLINICAL_INTERACTION_DATABASE: DrugInteraction[] = [
  {
    id: 'int-1',
    drugA: 'Warfarin',
    drugB: 'Ibuprofen',
    type: 'drug-drug',
    severity: 'critical',
    clinicalSummary: 'Concurrent use markedly increases hemorrhage and gastrointestinal ulceration risk due to synergistic platelet inhibition and gastrointestinal mucosal damage.',
    elderExplanation: 'Taking Warfarin with Ibuprofen greatly increases your risk of serious bleeding and stomach ulcers. Do not take them together.',
    recommendation: 'Avoid combination. Consider Acetaminophen (Tylenol) under 2,000mg/day for pain relief after consulting physician.',
  },
  {
    id: 'int-2',
    drugA: 'Warfarin',
    drugB: 'Aspirin',
    type: 'drug-drug',
    severity: 'major',
    clinicalSummary: 'Dual antithrombotic and anticoagulant therapy substantially elevates bleeding hazard unless strictly indicated post-cardiac stent.',
    elderExplanation: 'Both pills thin your blood. Taking them together makes you bruise very easily and can cause dangerous bleeding.',
    recommendation: 'Requires strict cardiologist and anticoagulation clinic supervision. Check INR levels regularly.',
  },
  {
    id: 'int-3',
    drugA: 'Telmisartan',
    drugB: 'Potassium Chloride',
    type: 'drug-drug',
    severity: 'critical',
    clinicalSummary: 'ARBs and ACE inhibitors cause renal potassium retention. Exogenous potassium risks life-threatening hyperkalemia and cardiac dysrhythmias.',
    elderExplanation: 'Telma (Telmisartan) already keeps potassium in your body. Extra potassium pills can dangerously spike your blood levels and affect your heart rhythm.',
    recommendation: 'Do not take potassium supplements unless explicitly monitored with periodic serum potassium blood tests.',
  },
  {
    id: 'int-3-lisinopril',
    drugA: 'Lisinopril',
    drugB: 'Potassium Chloride',
    type: 'drug-drug',
    severity: 'critical',
    clinicalSummary: 'ACE inhibitors reduce aldosterone secretion, causing renal potassium retention. Exogenous potassium risks life-threatening hyperkalemia and cardiac dysrhythmias.',
    elderExplanation: 'Lisinopril already keeps potassium in your body. Extra potassium pills can dangerously spike your blood levels and affect your heart rhythm.',
    recommendation: 'Do not take potassium supplements unless explicitly monitored with periodic serum potassium blood tests.',
  },
  {
    id: 'int-4',
    drugA: 'Lisinopril',
    drugB: 'Spironolactone',
    type: 'drug-drug',
    severity: 'major',
    clinicalSummary: 'Combined potassium-sparing diuretic and ACE inhibitor therapy poses significant hyperkalemia risk, especially in renal impairment.',
    elderExplanation: 'Both medications save potassium. Combined, they might make potassium build up too high in your bloodstream.',
    recommendation: 'Monitor serum creatinine and electrolytes within 1 week of initiation or dose change.',
  },
  {
    id: 'int-5',
    drugA: 'Atorvastatin',
    foodOrSubstance: 'Grapefruit / Grapefruit Juice',
    type: 'drug-food',
    severity: 'major',
    clinicalSummary: 'Furanocoumarins in grapefruit irreversibly inhibit intestinal CYP3A4, significantly increasing statin bioavailability and risks of rhabdomyolysis and liver toxicity.',
    elderExplanation: 'Grapefruit blocks the natural enzyme that breaks down your cholesterol pill. This can cause toxic levels of medicine to build up and hurt your muscles and kidneys.',
    recommendation: 'Completely eliminate grapefruit and grapefruit juice from your diet while on Atorvastatin or Simvastatin.',
  },
  {
    id: 'int-6',
    drugA: 'Simvastatin',
    drugB: 'Amlodipine',
    type: 'drug-drug',
    severity: 'moderate',
    clinicalSummary: 'Amlodipine inhibits CYP3A4-mediated metabolism of Simvastatin, increasing statin exposure and risk of myopathy.',
    elderExplanation: 'Amlodipine can make Simvastatin stronger in your bloodstream, leading to unexplained muscle aches or fatigue.',
    recommendation: 'Limit Simvastatin dose to 20 mg daily when co-prescribed with Amlodipine, or switch to Rosuvastatin or Pravastatin.',
  },
  {
    id: 'int-7',
    drugA: 'Metformin',
    foodOrSubstance: 'Excessive Alcohol',
    type: 'drug-food',
    severity: 'critical',
    clinicalSummary: 'Ethanol potentiates Metformin effect on lactate metabolism and impairs hepatic gluconeogenesis, precipitating severe lactic acidosis and hypoglycemia.',
    elderExplanation: 'Drinking alcohol with Metformin can cause a dangerous buildup of lactic acid in your blood and sudden dizzying drops in blood sugar.',
    recommendation: 'Avoid binge drinking or frequent alcohol consumption. Drink plenty of water and never drink on an empty stomach.',
  },
  {
    id: 'int-8',
    drugA: 'Levothyroxine',
    foodOrSubstance: 'Calcium / Dairy / Morning Coffee',
    type: 'drug-food',
    severity: 'moderate',
    clinicalSummary: 'Calcium carbonate and dietary elements chelate thyroid hormones in the stomach, reducing gastrointestinal absorption by up to 40%.',
    elderExplanation: 'Milk, cheese, coffee, and calcium supplements stop your thyroid medicine from absorbing properly into your body.',
    recommendation: 'Take Levothyroxine first thing in the morning with plain water at least 30-60 minutes before breakfast, coffee, or calcium pills.',
  },
  {
    id: 'int-9',
    drugA: 'Clopidogrel',
    drugB: 'Omeprazole',
    type: 'drug-drug',
    severity: 'major',
    clinicalSummary: 'Omeprazole competitively inhibits CYP2C19, preventing bioactivation of Clopidogrel into its active antiplatelet metabolite and doubling thrombosis risk.',
    elderExplanation: 'Omeprazole turns off the beneficial blood-clot prevention of Plavix (Clopidogrel), raising heart attack or stroke risks.',
    recommendation: 'Substitute Omeprazole with Pantoprazole or an H2 blocker like Famotidine (Pepcid), which does not block CYP2C19.',
  },
  {
    id: 'int-10',
    drugA: 'Digoxin',
    drugB: 'Amiodarone',
    type: 'drug-drug',
    severity: 'critical',
    clinicalSummary: 'Amiodarone inhibits P-glycoprotein renal and biliary transport of Digoxin, doubling serum digoxin concentrations and precipitating fatal ventricular arrhythmias.',
    elderExplanation: 'Amiodarone causes Digoxin to build up to toxic levels. Signs of toxicity include nausea, seeing yellow/green halos around lights, or confusion.',
    recommendation: 'Empirically decrease Digoxin dose by 50% upon initiating Amiodarone. Monitor serum Digoxin level weekly.',
  },
  {
    id: 'int-11',
    drugA: 'Warfarin',
    foodOrSubstance: 'High Vitamin K Foods (Kale, Spinach, Broccoli)',
    type: 'drug-food',
    severity: 'moderate',
    clinicalSummary: 'Sudden increases or decreases in dietary Vitamin K directly antagonize Warfarin anticoagulant mechanisms, leading to subtherapeutic INR and clot risks.',
    elderExplanation: 'Dark leafy greens have lots of Vitamin K, which naturally thickens blood and counteracts your blood thinner.',
    recommendation: 'You do not need to avoid greens entirely, but keep your intake consistent from week to week so your dosage remains stable.',
  },
  {
    id: 'int-12',
    drugA: 'Ciprofloxacin',
    foodOrSubstance: 'Milk, Yogurt, Calcium-Fortified Juices',
    type: 'drug-food',
    severity: 'major',
    clinicalSummary: 'Multivalent cations (calcium, magnesium) bind fluoroquinolones into insoluble chelates, reducing antibiotic bioavailability by up to 90%.',
    elderExplanation: 'Dairy products bind to this antibiotic and flush it out before it can fight your infection.',
    recommendation: 'Take Ciprofloxacin at least 2 hours before or 6 hours after consuming milk, yogurt, antacids, or calcium juices.',
  }
];

// Helper to normalize medication names for matching and synonym expansion
export function normalizeDrugName(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('telma') || lower.includes('telmisartan')) return 'telmisartan';
  if (lower.includes('glycomet') || lower.includes('metformin')) return 'metformin';
  if (lower.includes('rosuvas') || lower.includes('rosuvastatin')) return 'rosuvastatin';
  if (lower.includes('ecosprin') || lower.includes('aspirin')) return 'aspirin';
  if (lower.includes('brufen') || lower.includes('combiflam') || lower.includes('ibuprofen')) return 'ibuprofen';
  if (lower.includes('pan-d') || lower.includes('pantoprazole')) return 'pantoprazole';
  if (lower.includes('potklor') || lower.includes('potassium')) return 'potassium chloride';
  return lower.replace(/[^a-z0-9]/g, '');
}

/**
 * Checks all active medications and dietary items for potential interactions
 */
export function checkMedicationInteractions(
  medications: Medication[],
  dietaryItems: string[] = ['Grapefruit / Grapefruit Juice', 'High Vitamin K Foods (Kale, Spinach, Broccoli)', 'Milk, Yogurt, Calcium-Fortified Juices', 'Excessive Alcohol']
): DrugInteraction[] {
  const detectedInteractions: DrugInteraction[] = [];
  const medNames = medications.map(m => m.name.toLowerCase());

  for (const rule of CLINICAL_INTERACTION_DATABASE) {
    const drugAName = rule.drugA.toLowerCase();

    // Check drug-to-drug interactions
    if (rule.type === 'drug-drug' && rule.drugB) {
      const drugBName = rule.drugB.toLowerCase();
      const hasDrugA = medNames.some(m => m.includes(drugAName) || drugAName.includes(m));
      const hasDrugB = medNames.some(m => m.includes(drugBName) || drugBName.includes(m));

      if (hasDrugA && hasDrugB) {
        detectedInteractions.push(rule);
      }
    }

    // Check drug-to-food / substance interactions
    if (rule.type === 'drug-food' && rule.foodOrSubstance) {
      const hasDrugA = medNames.some(m => m.includes(drugAName) || drugAName.includes(m));
      if (hasDrugA) {
        detectedInteractions.push(rule);
      }
    }
  }

  return detectedInteractions;
}

/**
 * Checks if adding a single new medication would trigger interactions with existing list
 */
export function checkNewMedicationSafety(
  newMedName: string,
  existingMeds: Medication[]
): DrugInteraction[] {
  const hypotheticalList = [
    ...existingMeds,
    {
      id: 'temp-new',
      name: newMedName,
      dosage: '',
      form: 'tablet',
      frequency: 'daily',
      schedules: [],
      instructions: '',
      foodRequirement: 'no-restriction',
      pillColor: 'blue',
      pillShape: 'round',
      purpose: '',
      prescribingDoctor: '',
      prescriptionNumber: '',
      startDate: new Date().toISOString(),
      remainingCount: 30,
      totalRefillCount: 30,
      refillThreshold: 5,
      isActive: true,
    } as Medication
  ];

  return checkMedicationInteractions(hypotheticalList);
}
