/**
 * AirfieldOS GA - Fee Calculation & Invoicing Engine
 * Automatically derives fees from MTOW, movement type, circuits, parking, and fuel.
 */

import { AircraftMovement, AirfieldInvoice, InvoiceItem, AirfieldFeeSchedule } from '../types/airfield';

export interface FeeBreakdown {
  landingFee: number;
  touchAndGoFee: number;
  parkingFee: number;
  fuelFee: number;
  outOfHoursFee: number;
  handlingFee: number;
  subtotalGbp: number;
  vatGbp: number;
  totalGbp: number;
  items: InvoiceItem[];
}

/**
 * Returns standard UK GA landing fee based on Maximum Take-Off Weight (MTOW)
 * Uses custom AirfieldFeeSchedule if provided.
 */
export function getBaseLandingFee(mtowKg: number, schedule?: AirfieldFeeSchedule): number {
  if (schedule) {
    if (mtowKg <= 450) return schedule.microlightFee;
    if (mtowKg <= 1000) return schedule.sub1000KgFee;
    if (mtowKg <= 1500) return schedule.sub1500KgFee;
    if (mtowKg <= 2000) return schedule.sub2000KgFee;
    if (mtowKg <= 3000) return schedule.twinFee;
    const extraTonnes = Math.ceil((mtowKg - 3000) / 1000);
    return schedule.twinFee + extraTonnes * 20.0;
  }

  if (mtowKg <= 450) {
    return 12.0; // Microlight / VLA
  } else if (mtowKg <= 1000) {
    return 18.0; // C152, Robin, SportCruiser
  } else if (mtowKg <= 1500) {
    return 25.0; // PA-28, C172, DA40
  } else if (mtowKg <= 2000) {
    return 38.0; // Cirrus SR22, Beech Bonanza
  } else if (mtowKg <= 3000) {
    return 56.0; // DA42, Seneca, Baron
  } else if (mtowKg <= 5700) {
    const extraTonnes = Math.ceil((mtowKg - 3000) / 1000);
    return 105.0 + extraTonnes * 16.0; // King Air, PC-12
  } else {
    return 240.0; // Business Jets
  }
}

/**
 * Calculates complete fee breakdown for any flight movement
 */
export function calculateFlightFees(
  movement: AircraftMovement,
  schedule?: AirfieldFeeSchedule
): FeeBreakdown {
  const isResident = movement.category === 'RESIDENT_CLUB';
  const residentDiscountMultiplier = schedule
    ? (100 - schedule.residentDiscountPercent) / 100
    : 0.5;

  const items: InvoiceItem[] = [];

  let landingFee = 0;
  let touchAndGoFee = 0;
  let parkingFee = 0;
  let fuelFee = 0;
  let outOfHoursFee = 0;
  const handlingFee = 0;

  // 1. Landing fee (Waved or billed based on resident status & movement type)
  if (movement.movementKind === 'FULL_STOP_LANDING') {
    const baseLanding = getBaseLandingFee(movement.mtowKg, schedule);
    landingFee = isResident ? baseLanding * residentDiscountMultiplier : baseLanding;

    items.push({
      id: 'item-landing',
      description: `Landing Fee (MTOW ${movement.mtowKg}kg)${isResident ? ` [Resident Club ${schedule?.residentDiscountPercent || 50}%]` : ''}`,
      quantity: 1,
      unitPriceGbp: landingFee,
      amountGbp: landingFee,
    });
  }

  // 2. Touch and Go circuits fee
  if (movement.touchAndGoCount > 0) {
    const baseCircuitRate = schedule ? schedule.circuitFee : movement.mtowKg <= 1500 ? 10.0 : 16.0;
    const finalCircuitRate = isResident ? baseCircuitRate * residentDiscountMultiplier : baseCircuitRate;
    touchAndGoFee = movement.touchAndGoCount * finalCircuitRate;

    items.push({
      id: 'item-circuit',
      description: `Circuit Training / Touch-and-Go (${movement.touchAndGoCount} circuits)`,
      quantity: movement.touchAndGoCount,
      unitPriceGbp: finalCircuitRate,
      amountGbp: touchAndGoFee,
    });
  }

  // 3. Overnight Parking / Tie-down fee
  if (movement.overnightStay) {
    const isHangar = movement.parkingBayId.includes('Hangar');
    parkingFee = isHangar
      ? schedule?.overnightHangarFee || 45.0
      : schedule?.overnightGrassFee || 16.0;

    items.push({
      id: 'item-parking',
      description: `Overnight Parking (${isHangar ? 'Secure Hangarage' : 'Apron Grass Tie-down'})`,
      quantity: 1,
      unitPriceGbp: parkingFee,
      amountGbp: parkingFee,
    });
  }

  // 4. Fuel uplift
  if (movement.fuelUpliftLiters > 0 && movement.fuelType) {
    let pricePerLiter = 2.18; // AVGAS 100LL
    let fuelLabel = 'AVGAS 100LL';

    if (movement.fuelType === 'JET_A1') {
      pricePerLiter = 1.18;
      fuelLabel = 'Jet A-1 (Aviation Kerosene)';
    } else if (movement.fuelType === 'UL91') {
      pricePerLiter = 1.98;
      fuelLabel = 'UL91 Unleaded Aviation Gasoline';
    }

    fuelFee = parseFloat((movement.fuelUpliftLiters * pricePerLiter).toFixed(2));

    items.push({
      id: 'item-fuel',
      description: `${fuelLabel} Refueling Uplift (${movement.fuelUpliftLiters} L)`,
      quantity: movement.fuelUpliftLiters,
      unitPriceGbp: pricePerLiter,
      amountGbp: fuelFee,
    });
  }

  // 5. Out of Hours surcharge
  if (movement.outOfHours) {
    outOfHoursFee = 40.0;
    items.push({
      id: 'item-ooh',
      description: 'Out-of-Hours Airfield Operations Surcharge (Fire/Radio cover)',
      quantity: 1,
      unitPriceGbp: 40.0,
      amountGbp: 40.0,
    });
  }

  const subtotalGbp = parseFloat(
    (landingFee + touchAndGoFee + parkingFee + fuelFee + outOfHoursFee + handlingFee).toFixed(2)
  );

  // Standard UK VAT 20% on non-fuel airfield services (Fuel is already VAT-inclusive at pump)
  const taxableServices = landingFee + touchAndGoFee + parkingFee + outOfHoursFee + handlingFee;
  const vatGbp = parseFloat((taxableServices * 0.2).toFixed(2));
  const totalGbp = parseFloat((subtotalGbp + vatGbp).toFixed(2));

  return {
    landingFee,
    touchAndGoFee,
    parkingFee,
    fuelFee,
    outOfHoursFee,
    handlingFee,
    subtotalGbp,
    vatGbp,
    totalGbp,
    items,
  };
}

/**
 * Creates an Airfield Invoice object from an AircraftMovement
 */
export function generateInvoiceForMovement(
  movement: AircraftMovement,
  schedule?: AirfieldFeeSchedule
): AirfieldInvoice {
  const breakdown = calculateFlightFees(movement, schedule);
  const now = new Date();
  const invoiceNum = `INV-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  return {
    id: `inv-${Date.now()}`,
    invoiceNumber: invoiceNum,
    date: now.toISOString().split('T')[0],
    callsign: movement.callsign,
    aircraftType: movement.aircraftType,
    mtowKg: movement.mtowKg,
    pilotName: movement.pilotName,
    pilotEmail: movement.pilotEmail || `${movement.callsign.toLowerCase()}@pilot.co.uk`,
    movementId: movement.id,
    items: breakdown.items,
    subtotalGbp: breakdown.subtotalGbp,
    vatGbp: breakdown.vatGbp,
    totalGbp: breakdown.totalGbp,
    status: 'ISSUED',
  };
}
