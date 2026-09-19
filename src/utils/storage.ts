import {
  AirfieldProfile,
  Runway,
  ParkingBay,
  FuelStorageTank,
  AircraftMovement,
  ATSULogEntry,
  AirfieldInvoice,
  AirfieldWeather,
} from '../types/airfield';
import { PRESET_AIRFIELDS } from '../data/airfieldProfiles';
import {
  INITIAL_WEATHER,
  INITIAL_MOVEMENTS,
  INITIAL_ATSU_LOGS,
  INITIAL_INVOICES,
} from '../data/initialAirfieldState';

export interface AerodromeDatabaseState {
  version: string;
  lastUpdated: string;
  activeAirfieldId: string;
  airfieldProfile: AirfieldProfile;
  customProfiles: AirfieldProfile[];
  runways: Runway[];
  parkingBays: ParkingBay[];
  fuelTanks: FuelStorageTank[];
  movements: AircraftMovement[];
  atsuLogs: ATSULogEntry[];
  invoices: AirfieldInvoice[];
  weather: AirfieldWeather;
}

const STORAGE_KEY = 'airfieldos_ga_database_v1';

export function getDefaultDatabaseState(): AerodromeDatabaseState {
  const defaultPreset = PRESET_AIRFIELDS[0]; // Meadowfield (EGMS)
  return {
    version: '1.2.0',
    lastUpdated: new Date().toISOString(),
    activeAirfieldId: defaultPreset.profile.id,
    airfieldProfile: defaultPreset.profile,
    customProfiles: PRESET_AIRFIELDS.map((p) => p.profile),
    runways: defaultPreset.runways,
    parkingBays: defaultPreset.parkingBays,
    fuelTanks: defaultPreset.fuelTanks,
    movements: INITIAL_MOVEMENTS,
    atsuLogs: INITIAL_ATSU_LOGS,
    invoices: INITIAL_INVOICES,
    weather: INITIAL_WEATHER,
  };
}

export function loadDatabaseFromStorage(): AerodromeDatabaseState {
  if (typeof window === 'undefined') return getDefaultDatabaseState();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultDatabaseState();

    const parsed = JSON.parse(raw) as AerodromeDatabaseState;
    if (!parsed.airfieldProfile || !parsed.movements) {
      return getDefaultDatabaseState();
    }
    return parsed;
  } catch (err) {
    console.error('Failed to load database from localStorage:', err);
    return getDefaultDatabaseState();
  }
}

export function saveDatabaseToStorage(state: AerodromeDatabaseState): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const stateToSave: AerodromeDatabaseState = {
      ...state,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    return true;
  } catch (err) {
    console.error('Failed to save database to localStorage:', err);
    return false;
  }
}

export function downloadJsonFile(filename: string, data: object) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadCsvFile(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports complete CAA CAP 797 Statutory Movement Logbook to CSV
 */
export function exportAtsuLogsToCsv(logs: ATSULogEntry[], icao: string): void {
  const headers = [
    'Seq #',
    'Date & UTC Time',
    'Callsign / Reg',
    'Aircraft Type',
    'MTOW (kg)',
    'Pilot in Command (PIC)',
    'Movement Type',
    'Flight Rules',
    'Runway In Use',
    'POB',
    'Origin',
    'Destination',
    'Service Provided',
    'Circuits / T&G',
    'Fee (£ GBP)',
    'Payment Method',
    'Radio Log Remarks',
  ];

  const rows = logs.map((log) => [
    log.logSequence,
    `"${log.timestampUtc}"`,
    `"${log.callsign}"`,
    `"${log.aircraftType}"`,
    log.mtowKg,
    `"${log.pilotName}"`,
    log.movementType,
    log.flightRules,
    `"${log.runway}"`,
    log.pob,
    `"${log.routeFrom}"`,
    `"${log.routeTo}"`,
    `"${log.atsuServiceProvided}"`,
    log.touchAndGoCompleted,
    log.feeCalculatedGbp.toFixed(2),
    log.paymentMethod,
    `"${log.radioLogRemarks.replace(/"/g, '""')}"`,
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadCsvFile(`CAA_CAP797_Movement_Logbook_${icao}_${dateStr}.csv`, csv);
}

/**
 * Exports Master Flight Movements & Landed Airplanes Table to CSV
 */
export function exportMovementsToCsv(movements: AircraftMovement[], icao: string): void {
  const headers = [
    'ID',
    'Callsign',
    'Aircraft Type',
    'MTOW (kg)',
    'Category',
    'Pilot Name',
    'Pilot Phone',
    'Origin Base',
    'PPR #',
    'Flight Rules',
    'Status',
    'Scheduled Time',
    'Actual Time',
    'Runway',
    'Parking Stand',
    'Circuits',
    'Fuel Uplift (L)',
    'Fuel Type',
    'Overnight',
    'Noise Acknowledged',
    'Billing Status',
  ];

  const rows = movements.map((m) => [
    m.id,
    `"${m.callsign}"`,
    `"${m.aircraftType}"`,
    m.mtowKg,
    m.category,
    `"${m.pilotName}"`,
    `"${m.pilotPhone}"`,
    `"${m.homeBase}"`,
    `"${m.pprNumber}"`,
    m.flightRules,
    m.status,
    `"${m.scheduledTime}"`,
    `"${m.actualTime || ''}"`,
    `"${m.runway}"`,
    `"${m.parkingBayId}"`,
    m.touchAndGoCount,
    m.fuelUpliftLiters || 0,
    m.fuelType || '',
    m.overnightStay ? 'YES' : 'NO',
    m.noiseAbatementAcknowledged ? 'YES' : 'NO',
    m.billingStatus,
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadCsvFile(`AirfieldOS_Flight_Movements_${icao}_${dateStr}.csv`, csv);
}
