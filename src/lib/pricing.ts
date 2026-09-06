export type VehicleSize = 'small' | 'medium' | 'large' | 'xl';
export type ConditionLevel = 'relatively-clean' | 'moderately-dirty' | 'very-dirty';
export type TravelZone = 'napa-core' | 'up-valley-sonoma' | 'north-bay-solano' | 'extended-bay';

export type AddOnKey =
  | 'pet-hair'
  | 'fabric-extraction'
  | 'paint-decon'
  | 'engine-bay'
  | 'headlight-restoration'
  | 'sealant-upgrade';

export const vehicleSizes: Record<VehicleSize, { label: string; base: number; examples: string; durationMinutes: number }> = {
  small: {
    label: 'Small / Sedan',
    base: 299,
    examples: 'Porsche 911, BMW 3 Series, Mercedes C-Class, Tesla Model 3',
    durationMinutes: 180,
  },
  medium: {
    label: 'Medium / Crossover',
    base: 329,
    examples: 'Porsche Macan, BMW X3, Mercedes GLC, Tesla Model Y',
    durationMinutes: 195,
  },
  large: {
    label: 'Large / SUV or Truck',
    base: 369,
    examples: 'Range Rover Sport, BMW X5, Mercedes GLE, full-size pickup',
    durationMinutes: 225,
  },
  xl: {
    label: 'XL / 3-Row or Oversize',
    base: 399,
    examples: 'Escalade, Suburban, GLS, lifted or oversized truck',
    durationMinutes: 255,
  },
};

export const conditionLevels: Record<ConditionLevel, { label: string; surcharge: number; examples: string; durationMinutes: number }> = {
  'relatively-clean': {
    label: 'Relatively Clean',
    surcharge: 0,
    examples: 'Regularly maintained, light dust, normal road film, minimal clutter or staining.',
    durationMinutes: 0,
  },
  'moderately-dirty': {
    label: 'Moderately Dirty',
    surcharge: 40,
    examples: 'Visible buildup, moderate crumbs or debris, light stains, dirty wheels, or several months since a full detail.',
    durationMinutes: 30,
  },
  'very-dirty': {
    label: 'Very Dirty',
    surcharge: 90,
    examples: 'Heavy buildup, significant staining, embedded debris, pet hair, excessive mud, or neglected surfaces.',
    durationMinutes: 90,
  },
};

export const careLevels: Record<number, { label: string; adjustment: number; description: string; durationMinutes: number }> = {
  1: { label: 'Maintenance', adjustment: -60, description: 'A lighter refresh for a vehicle already kept in excellent condition.', durationMinutes: -45 },
  2: { label: 'Refresh', adjustment: -30, description: 'A lighter-than-standard detail focused on presentation and upkeep.', durationMinutes: -20 },
  3: { label: 'The Standard', adjustment: 0, description: 'The flagship Smith Standard Detail and recommended starting point.', durationMinutes: 0 },
  4: { label: 'Deep Detail', adjustment: 75, description: 'Additional time and attention for deeper cleaning and correction-oriented work.', durationMinutes: 60 },
  5: { label: 'Restoration Focus', adjustment: 150, description: 'Maximum-detailing intensity for vehicles needing substantially more labor.', durationMinutes: 120 },
};

export const addOns: Record<AddOnKey, { label: string; price: number; durationMinutes: number; description: string }> = {
  'pet-hair': { label: 'Heavy Pet Hair', price: 45, durationMinutes: 30, description: 'Additional removal time for embedded pet hair.' },
  'fabric-extraction': { label: 'Fabric Extraction', price: 60, durationMinutes: 45, description: 'Deeper fabric/carpet extraction where appropriate.' },
  'paint-decon': { label: 'Paint Decontamination', price: 50, durationMinutes: 35, description: 'Additional bonded-contaminant removal before protection.' },
  'engine-bay': { label: 'Engine Bay Detail', price: 45, durationMinutes: 30, description: 'Careful engine-bay cleaning and presentation.' },
  'headlight-restoration': { label: 'Headlight Restoration', price: 80, durationMinutes: 45, description: 'Restoration work for oxidized or hazy lenses.' },
  'sealant-upgrade': { label: 'Protection Upgrade', price: 50, durationMinutes: 20, description: 'Upgraded paint-protection application beyond the base booked service.' },
};

export const travelZones: Record<TravelZone, { label: string; fee: number; examples: string }> = {
  'napa-core': {
    label: 'Napa Core',
    fee: 0,
    examples: 'Napa, Yountville, American Canyon and nearby core service area.',
  },
  'up-valley-sonoma': {
    label: 'Up-Valley / Sonoma',
    fee: 25,
    examples: 'St. Helena, Calistoga, Sonoma and comparable drive times.',
  },
  'north-bay-solano': {
    label: 'North Bay / Solano',
    fee: 45,
    examples: 'Santa Rosa, Petaluma, Fairfield, Vallejo and comparable drive times.',
  },
  'extended-bay': {
    label: 'Extended Bay Area',
    fee: 75,
    examples: 'Novato, Marin and other extended service areas; farther trips may require a custom quote.',
  },
};

export interface QuoteInput {
  vehicleSize: VehicleSize;
  condition: ConditionLevel;
  careLevel: number;
  addOns?: AddOnKey[];
  travelZone: TravelZone;
  membershipOptIn?: boolean;
}

export interface QuoteResult {
  subtotal: number;
  membershipDiscount: number;
  total: number;
  deposit: number;
  balance: number;
  recurringMembershipPrice: number;
  estimatedDurationMinutes: number;
  crewRequired: number;
}

export function calculateQuote(input: QuoteInput): QuoteResult {
  const vehicle = vehicleSizes[input.vehicleSize];
  const condition = conditionLevels[input.condition];
  const care = careLevels[input.careLevel] ?? careLevels[3];
  const selectedAddOns = input.addOns ?? [];
  const addOnTotal = selectedAddOns.reduce((sum, key) => sum + addOns[key].price, 0);
  const addOnMinutes = selectedAddOns.reduce((sum, key) => sum + addOns[key].durationMinutes, 0);
  const travel = travelZones[input.travelZone];

  const subtotal = Math.max(199, vehicle.base + condition.surcharge + care.adjustment + addOnTotal + travel.fee);
  const membershipDiscount = input.membershipOptIn ? Math.round(subtotal * 0.10 * 100) / 100 : 0;
  const total = Math.round((subtotal - membershipDiscount) * 100) / 100;
  const deposit = Math.round((total * 0.5) * 100) / 100;
  const balance = Math.round((total - deposit) * 100) / 100;
  const recurringMembershipPrice = Math.round((subtotal * 0.70) * 100) / 100;
  const estimatedDurationMinutes = Math.max(
    120,
    vehicle.durationMinutes + condition.durationMinutes + care.durationMinutes + addOnMinutes,
  );

  return {
    subtotal,
    membershipDiscount,
    total,
    deposit,
    balance,
    recurringMembershipPrice,
    estimatedDurationMinutes,
    crewRequired: 2,
  };
}

export function travelFeeFromOneWayMinutes(oneWayMinutes: number) {
  // Operational fallback for locations outside the preset zones:
  // first 30 minutes one-way are absorbed; after that, charge $1.50 per extra driving minute.
  return Math.max(0, Math.round((oneWayMinutes - 30) * 1.5));
}

export const pricingNotes = {
  firstVisitMembershipDiscount: '10% off the first booked detail when the customer opts into membership.',
  recurringMembershipDiscount: '30% off the recurring detail price, scheduled every two months.',
  paymentSchedule: '50% due to reserve the appointment; remaining 50% due after the detail.',
  travelFormula: 'Core service area included. Outside the preset zones, use $1.50 per one-way driving minute beyond the first 30 minutes, plus tolls if applicable.',
};
