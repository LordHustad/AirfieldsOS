/**
 * AirfieldOS GA - Type Definitions for General Aviation Aerodrome Management
 * Aligned with UK CAA CAP 797 (AFISO), CAP 452 (A/G Radio), CAP 413 (Radiotelephony)
 */

export type RunwaySurface = 'ASPHALT' | 'GRASS';
export type RunwayCondition = 'DRY' | 'DAMP' | 'WET' | 'WATERLOGGED' | 'SOFT_GROUND' | 'CLOSED';

export interface AirfieldFeeSchedule {
  microlightFee: number;       // <= 450 kg
  sub1000KgFee: number;        // 451 - 1000 kg
  sub1500KgFee: number;        // 1001 - 1500 kg
  sub2000KgFee: number;        // 1501 - 2000 kg
  twinFee: number;             // > 2000 kg
  circuitFee: number;          // Per touch and go
  overnightGrassFee: number;   // Per night grass tie-down
  overnightHangarFee: number;  // Per night hangarage
  residentDiscountPercent: number; // e.g. 50
  outOfHoursFee: number;       // Surcharge
}

export interface AirfieldProfile {
  id: string;
  icao: string;
  name: string;
  location: string;
  elevationFt: number;
  radioCallsign: string;
  radioFrequency: string;
  safetyCom: string;
  atisFrequency?: string;
  circuitHeightAglFt: number;
  circuitHeightQnhFt: number;
  operatingHours: string;
  operatingDays: string;
  atsService: string;
  caaAerodromeLicense: string;
  noiseAbatementProcedures: string;
  pavementLimitKg: number;
  contactEmail: string;
  contactPhone: string;
  feeSchedule: AirfieldFeeSchedule;
}

export interface Runway {
  id: string;
  designation: string; // e.g. "06/24"
  reciprocal: string;  // e.g. "06" or "24"
  headingDegrees: number;
  surface: RunwaySurface;
  lengthMeters: number;
  widthMeters: number;
  toraMeters: number;
  ldaMeters: number;
  condition: RunwayCondition;
  isInUse: boolean;
  circuitDirection: 'LEFT_HAND' | 'RIGHT_HAND';
  noiseSensitiveSide: string; // e.g. "Avoid Highfield Village to South"
}

export interface AirfieldWeather {
  windDegrees: number;
  windSpeedKnots: number;
  windGustKnots: number;
  qnhHpa: number;
  visibilityMeters: number;
  cloudBaseFt: number;
  temperatureC: number;
  dewpointC: number;
  surfaceConditionNotes: string;
  activeRunway: string;
  headwindKnots: number;
  crosswindKnots: number;
  crosswindDirection: 'LEFT' | 'RIGHT' | 'DIRECT';
}

export type FuelType = 'AVGAS_100LL' | 'JET_A1' | 'UL91';

export interface FuelStorageTank {
  id: string;
  fuelType: FuelType;
  name: string;
  capacityLiters: number;
  currentLevelLiters: number;
  pricePerLiterPence: number; // in pence e.g. 215 = £2.15
  exciseDutyExemptAllowed: boolean;
  pumpStatus: 'OPERATIONAL' | 'REFUELING_IN_PROGRESS' | 'LOW_STOCK' | 'CALIBRATION';
}

export type ParkingBayType = 'HARDSTANDING' | 'GRASS_TIEDOWN' | 'HANGAR_MAINTENANCE' | 'FUEL_BAY';

export interface ParkingBay {
  id: string;
  name: string;
  type: ParkingBayType;
  maxWingspanMeters: number;
  maxWeightKg: number;
  occupiedByCallsign: string | null;
  tieDownRingsAvailable: boolean;
  isGrassSoft: boolean;
}

export type MovementStatus =
  | 'PPR_REQUESTED'
  | 'EN_ROUTE_INBOUND'
  | 'OVERHEAD_JOIN'
  | 'IN_CIRCUIT'
  | 'LANDED_TAXIED'
  | 'PARKED'
  | 'REFUELING'
  | 'TAXI_OUT'
  | 'DEPARTED'
  | 'CANCELLED';

export type MovementKind =
  | 'FULL_STOP_LANDING'
  | 'TOUCH_AND_GO'
  | 'OVERHEAD_TRANSIT'
  | 'DEPARTURE';

export type PilotCategory = 'RESIDENT_CLUB' | 'RESIDENT_PRIVATE' | 'VISITING_PRIVATE' | 'VISITING_COMMERCIAL';

export interface OperationalAlert {
  id: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  category: 'CROSSWIND' | 'NOISE_ABATEMENT' | 'CIRCUIT_CAPACITY' | 'GRASS_CONDITION' | 'CURFEW' | 'WEIGHT_LIMIT';
  title: string;
  description: string;
  recommendedAction: string;
}

export interface AircraftMovement {
  id: string;
  callsign: string; // e.g. "G-BTAW", "N452X", "G-ROBN"
  aircraftType: string; // e.g. "Piper PA-28-161 Warrior"
  mtowKg: number; // Maximum Take-Off Weight (e.g. 1107)
  category: PilotCategory;
  pilotName: string;
  pilotPhone: string;
  pilotEmail?: string;
  homeBase: string; // e.g. "EGTF" or "EGTO"
  pprNumber: string; // e.g. "PPR-2026-0842"
  flightRules: 'VFR' | 'IFR';
  pob: number; // Persons on board
  movementKind: MovementKind;
  status: MovementStatus;
  scheduledTime: string; // "14:20"
  actualTime?: string;
  etaMinutes: number;
  runway: string;
  parkingBayId: string;
  touchAndGoCount: number;
  fuelUpliftLiters: number;
  fuelType?: FuelType;
  outOfHours: boolean;
  overnightStay: boolean;
  noiseAbatementAcknowledged: boolean;
  pilotNotes?: string;
  managerNotes?: string;
  activeAlerts: OperationalAlert[];
  billingStatus: 'UNBILLED' | 'INVOICED' | 'PAID' | 'RESIDENT_LEDGER';
  invoiceId?: string;
}

export interface ATSULogEntry {
  id: string;
  logSequence: number; // Official sequential movement number (e.g. 142)
  timestampUtc: string; // "14:23 UTC"
  timestampMinutes: number;
  callsign: string;
  aircraftType: string;
  mtowKg: number;
  pilotName: string;
  movementType: 'ARR' | 'DEP' | 'T&G' | 'TRANSIT';
  flightRules: 'VFR' | 'IFR';
  runway: string;
  pob: number;
  routeFrom: string;
  routeTo: string;
  atsuServiceProvided: 'A/G Radio' | 'AFIS (Flight Information)' | 'Airfield SafetyCom';
  touchAndGoCompleted: number;
  radioLogRemarks: string; // Statutory text record
  feeCalculatedGbp: number;
  paymentMethod: 'INVOICED' | 'CARD_TERMINAL' | 'CASH' | 'CLUB_ACCOUNT' | 'EXEMPT';
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPriceGbp: number;
  amountGbp: number;
}

export interface AirfieldInvoice {
  id: string;
  invoiceNumber: string; // e.g. "INV-2026-0419"
  date: string;
  callsign: string;
  aircraftType: string;
  mtowKg: number;
  pilotName: string;
  pilotEmail: string;
  movementId: string;
  items: InvoiceItem[];
  subtotalGbp: number;
  vatGbp: number; // 20% standard UK VAT
  totalGbp: number;
  status: 'DRAFT' | 'ISSUED' | 'PAID';
  paymentDate?: string;
  paymentReference?: string;
}

export interface AirfieldDashboardMetrics {
  totalMovementsToday: number;
  activeCircuitCount: number; // Max allowed 5
  arrivalsPending: number;
  departuresPending: number;
  aircraftOnGround: number;
  avgasStockLiters: number;
  jetA1StockLiters: number;
  dailyRevenueGbp: number;
  unbilledRevenueGbp: number;
  activeSafetyAlerts: number;
}
