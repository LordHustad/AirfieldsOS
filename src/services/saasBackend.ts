import { SaaSUser, SaaSOrganization, AuthSession, UserRole } from '../types/auth';
import { AerodromeDatabaseState } from '../utils/storage';
import { PRESET_AIRFIELDS } from '../data/airfieldProfiles';
import {
  INITIAL_WEATHER,
  INITIAL_MOVEMENTS,
  INITIAL_ATSU_LOGS,
  INITIAL_INVOICES,
} from '../data/initialAirfieldState';
import {
  AirfieldProfile,
  Runway,
  ParkingBay,
  FuelStorageTank,
  AircraftMovement,
  ATSULogEntry,
  AirfieldInvoice,
} from '../types/airfield';

const USERS_STORAGE_KEY = 'airfieldos_registered_users_v2';
const CURRENT_SESSION_KEY = 'airfieldos_active_session_v2';

// 3 Default Verified Operator Accounts for zero-friction testing & demo isolation
export const DEFAULT_USERS: SaaSUser[] = [
  {
    id: 'usr_sarah_meadowfield',
    email: 'sarah.jenkins@meadowfield-airfield.co.uk',
    name: 'Sarah Jenkins',
    title: 'Aerodrome General Manager & AFISO',
    role: 'AIRFIELD_MANAGER',
    organizationId: 'org_meadowfield',
    airfieldName: 'Meadowfield Aerodrome',
    icao: 'EGMS',
    avatarColor: '#18181b', // zinc-900
    createdAt: '2026-01-15T08:00:00Z',
  },
  {
    id: 'usr_james_compton',
    email: 'james.sterling@comptonabbasairfield.co.uk',
    name: 'Capt. James Sterling',
    title: 'Senior Duty Controller & Operations Director',
    role: 'DUTY_CONTROLLER',
    organizationId: 'org_compton',
    airfieldName: 'Compton Abbas Airfield',
    icao: 'EGHA',
    avatarColor: '#27272a', // zinc-800
    createdAt: '2026-02-01T09:30:00Z',
  },
  {
    id: 'usr_marcus_wessex',
    email: 'marcus.vance@wessex-aviation.com',
    name: 'Marcus Vance',
    title: 'FBO Ramp Operations & Accounts Head',
    role: 'FBO_ADMIN',
    organizationId: 'org_wessex',
    airfieldName: 'Wessex Executive Jet Centre',
    icao: 'EGWX',
    avatarColor: '#3f3f46', // zinc-700
    createdAt: '2026-03-10T11:00:00Z',
  },
];

export const DEFAULT_ORGANIZATIONS: Record<string, SaaSOrganization> = {
  org_meadowfield: {
    id: 'org_meadowfield',
    name: 'Meadowfield Aerodrome Ltd',
    icao: 'EGMS',
    location: 'Cotswolds, Gloucestershire, UK',
    tier: 'LICENSED',
    primaryRadio: '122.705 MHz',
    ownerUserId: 'usr_sarah_meadowfield',
    createdAt: '2026-01-15T08:00:00Z',
  },
  org_compton: {
    id: 'org_compton',
    name: 'Compton Abbas Aviation Hub',
    icao: 'EGHA',
    location: 'Dorset Downs, Shaftesbury, UK',
    tier: 'LICENSED',
    primaryRadio: '122.705 MHz',
    ownerUserId: 'usr_james_compton',
    createdAt: '2026-02-01T09:30:00Z',
  },
  org_wessex: {
    id: 'org_wessex',
    name: 'Wessex Jet Centre FBO',
    icao: 'EGWX',
    location: 'Hampshire Corridor, UK',
    tier: 'REGIONAL',
    primaryRadio: '123.400 MHz',
    ownerUserId: 'usr_marcus_wessex',
    createdAt: '2026-03-10T11:00:00Z',
  },
};

/**
 * Retrieves all registered users from storage or initializes defaults
 */
export function getRegisteredUsers(): SaaSUser[] {
  if (typeof window === 'undefined') return DEFAULT_USERS;
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_USERS;
  } catch (err) {
    console.error('Failed to get registered users:', err);
    return DEFAULT_USERS;
  }
}

/**
 * Gets storage key for a user's isolated data tenant
 */
export function getUserTenantStorageKey(userId: string): string {
  return `airfieldos_tenant_${userId}_db_v2`;
}

/**
 * Creates an initial isolated database tailored to the user's specific airfield
 */
function createInitialUserDatabase(user: SaaSUser): AerodromeDatabaseState {
  // Find if there's a matching preset (EGMS, EGHA, etc.)
  const matchingPreset = PRESET_AIRFIELDS.find((p) => p.profile.icao.toUpperCase() === user.icao.toUpperCase());

  if (matchingPreset) {
    // Clone preset so each user has an isolated working copy
    const clonedMovements: AircraftMovement[] = JSON.parse(JSON.stringify(INITIAL_MOVEMENTS));
    const clonedAtsu: ATSULogEntry[] = JSON.parse(JSON.stringify(INITIAL_ATSU_LOGS));
    const clonedInvoices: AirfieldInvoice[] = JSON.parse(JSON.stringify(INITIAL_INVOICES));

    return {
      version: '2.0.0',
      lastUpdated: new Date().toISOString(),
      activeAirfieldId: matchingPreset.profile.id,
      airfieldProfile: JSON.parse(JSON.stringify(matchingPreset.profile)),
      customProfiles: [JSON.parse(JSON.stringify(matchingPreset.profile))],
      runways: JSON.parse(JSON.stringify(matchingPreset.runways)),
      parkingBays: JSON.parse(JSON.stringify(matchingPreset.parkingBays)),
      fuelTanks: JSON.parse(JSON.stringify(matchingPreset.fuelTanks)),
      movements: clonedMovements,
      atsuLogs: clonedAtsu,
      invoices: clonedInvoices,
      weather: {
        ...INITIAL_WEATHER,
        activeRunway: matchingPreset.runways[0]?.reciprocal || '24',
      },
    };
  }

  // Generate completely custom isolated seed data for newly registered airfields
  const customProfile: AirfieldProfile = {
    id: `profile_${user.icao.toLowerCase()}`,
    icao: user.icao.toUpperCase(),
    name: user.airfieldName,
    location: 'United Kingdom Airspace',
    elevationFt: 250,
    radioCallsign: `${user.airfieldName} Radio`,
    radioFrequency: '122.805 MHz',
    safetyCom: '135.480 MHz',
    circuitHeightAglFt: 1000,
    circuitHeightQnhFt: 1250,
    operatingHours: '08:30 - 18:00 Local',
    operatingDays: 'Daily (7 days / week)',
    atsService: 'Air/Ground Radio (A/G)',
    caaAerodromeLicense: `CAA/AGA/2026/${Math.floor(1000 + Math.random() * 9000)}`,
    noiseAbatementProcedures: 'Climb to 600ft before turning. Avoid direct overflight of nearby residential villages.',
    pavementLimitKg: 5700,
    contactEmail: user.email,
    contactPhone: '+44 (0) 1632 960000',
    feeSchedule: {
      microlightFee: 12.0,
      sub1000KgFee: 18.0,
      sub1500KgFee: 25.0,
      sub2000KgFee: 38.0,
      twinFee: 65.0,
      circuitFee: 10.0,
      overnightGrassFee: 15.0,
      overnightHangarFee: 40.0,
      residentDiscountPercent: 50,
      outOfHoursFee: 35.0,
    },
  };

  const customRunways: Runway[] = [
    {
      id: `rwy_${user.icao.toLowerCase()}_09_27`,
      designation: '09 / 27 (Main Hard)',
      reciprocal: '27',
      headingDegrees: 270,
      surface: 'ASPHALT',
      lengthMeters: 920,
      widthMeters: 25,
      toraMeters: 920,
      ldaMeters: 850,
      condition: 'DRY',
      isInUse: true,
      circuitDirection: 'LEFT_HAND',
      noiseSensitiveSide: 'Standard circuits: Maintain circuit altitude until base leg',
    },
    {
      id: `rwy_${user.icao.toLowerCase()}_03_21_grass`,
      designation: '03 / 21 (Grass Strip)',
      reciprocal: '21',
      headingDegrees: 210,
      surface: 'GRASS',
      lengthMeters: 640,
      widthMeters: 30,
      toraMeters: 640,
      ldaMeters: 600,
      condition: 'DAMP',
      isInUse: false,
      circuitDirection: 'RIGHT_HAND',
      noiseSensitiveSide: 'Taildraggers & vintage aircraft preference strip',
    },
  ];

  const customBays: ParkingBay[] = [
    {
      id: `bay_${user.icao.toLowerCase()}_h1`,
      name: 'Hardstanding Bay H1 (Fuel Stand)',
      type: 'HARDSTANDING',
      maxWingspanMeters: 14,
      maxWeightKg: 4000,
      occupiedByCallsign: null,
      tieDownRingsAvailable: true,
      isGrassSoft: false,
    },
    {
      id: `bay_${user.icao.toLowerCase()}_g1`,
      name: 'Grass Tiedown G1 (Visiting Apron)',
      type: 'GRASS_TIEDOWN',
      maxWingspanMeters: 12,
      maxWeightKg: 2000,
      occupiedByCallsign: null,
      tieDownRingsAvailable: true,
      isGrassSoft: false,
    },
    {
      id: `bay_${user.icao.toLowerCase()}_hangar`,
      name: 'Maintenance Hangar Bay 1',
      type: 'HANGAR_MAINTENANCE',
      maxWingspanMeters: 16,
      maxWeightKg: 5700,
      occupiedByCallsign: null,
      tieDownRingsAvailable: true,
      isGrassSoft: false,
    },
  ];

  const customFuelTanks: FuelStorageTank[] = [
    {
      id: `tank_${user.icao.toLowerCase()}_avgas`,
      fuelType: 'AVGAS_100LL',
      name: 'Main Underground AVGAS Tank & Bowser',
      capacityLiters: 20000,
      currentLevelLiters: 14200,
      pricePerLiterPence: 215,
      exciseDutyExemptAllowed: true,
      pumpStatus: 'OPERATIONAL',
    },
    {
      id: `tank_${user.icao.toLowerCase()}_jeta1`,
      fuelType: 'JET_A1',
      name: 'Jet A-1 Pressure Bowser',
      capacityLiters: 25000,
      currentLevelLiters: 18500,
      pricePerLiterPence: 125,
      exciseDutyExemptAllowed: true,
      pumpStatus: 'OPERATIONAL',
    },
  ];

  // Fresh isolated movements for this new operator
  const customMovements: AircraftMovement[] = [
    {
      id: `mov-${user.icao.toLowerCase()}-101`,
      callsign: 'G-CLIO',
      aircraftType: 'Piper PA-28 Archer II',
      mtowKg: 1157,
      category: 'RESIDENT_CLUB',
      pilotName: 'Capt. Roger Davies',
      pilotPhone: '+44 7700 900123',
      pilotEmail: 'roger.davies@aeroclub.co.uk',
      homeBase: user.icao.toUpperCase(),
      pprNumber: `PPR-${user.icao.toUpperCase()}-084`,
      flightRules: 'VFR',
      pob: 2,
      movementKind: 'TOUCH_AND_GO',
      status: 'LANDED_TAXIED',
      scheduledTime: '09:30',
      actualTime: '09:34',
      etaMinutes: 0,
      runway: '27',
      parkingBayId: 'H1',
      touchAndGoCount: 3,
      fuelUpliftLiters: 45,
      fuelType: 'AVGAS_100LL',
      outOfHours: false,
      overnightStay: false,
      noiseAbatementAcknowledged: true,
      pilotNotes: 'Circuit training with student pilot.',
      managerNotes: 'Resident club discount applied.',
      activeAlerts: [],
      billingStatus: 'RESIDENT_LEDGER',
      invoiceId: `inv-${user.icao.toLowerCase()}-1001`,
    },
    {
      id: `mov-${user.icao.toLowerCase()}-102`,
      callsign: 'N844GA',
      aircraftType: 'Cirrus SR22 G6',
      mtowKg: 1542,
      category: 'VISITING_PRIVATE',
      pilotName: 'Mark Sterling',
      pilotPhone: '+44 7700 900456',
      pilotEmail: 'mark@sterling-holdings.co.uk',
      homeBase: 'EGLD',
      pprNumber: `PPR-${user.icao.toUpperCase()}-085`,
      flightRules: 'VFR',
      pob: 3,
      movementKind: 'FULL_STOP_LANDING',
      status: 'PARKED',
      scheduledTime: '11:15',
      actualTime: '11:20',
      etaMinutes: 0,
      runway: '27',
      parkingBayId: 'G1',
      touchAndGoCount: 0,
      fuelUpliftLiters: 110,
      fuelType: 'AVGAS_100LL',
      outOfHours: false,
      overnightStay: true,
      noiseAbatementAcknowledged: true,
      pilotNotes: 'Visiting flight from Denham for business meeting.',
      managerNotes: 'Overnight stay booked on Grass Tiedown G1.',
      activeAlerts: [],
      billingStatus: 'PAID',
      invoiceId: `inv-${user.icao.toLowerCase()}-1002`,
    },
  ];

  const customAtsuLogs: ATSULogEntry[] = [
    {
      id: `log-${user.icao.toLowerCase()}-1`,
      logSequence: 1,
      timestampUtc: '09:34 UTC',
      timestampMinutes: 574,
      callsign: 'G-CLIO',
      aircraftType: 'PA28',
      mtowKg: 1157,
      pilotName: 'Capt. Roger Davies',
      movementType: 'T&G',
      flightRules: 'VFR',
      runway: '27',
      pob: 2,
      routeFrom: `${user.icao.toUpperCase()} Local`,
      routeTo: `${user.icao.toUpperCase()} Local`,
      atsuServiceProvided: 'A/G Radio',
      touchAndGoCompleted: 3,
      radioLogRemarks: 'Downwind rwy 27, 3 circuits completed, landed full stop.',
      feeCalculatedGbp: 32.5,
      paymentMethod: 'CLUB_ACCOUNT',
    },
    {
      id: `log-${user.icao.toLowerCase()}-2`,
      logSequence: 2,
      timestampUtc: '11:20 UTC',
      timestampMinutes: 680,
      callsign: 'N844GA',
      aircraftType: 'SR22',
      mtowKg: 1542,
      pilotName: 'Mark Sterling',
      movementType: 'ARR',
      flightRules: 'VFR',
      runway: '27',
      pob: 3,
      routeFrom: 'EGLD Denham',
      routeTo: user.icao.toUpperCase(),
      atsuServiceProvided: 'A/G Radio',
      touchAndGoCompleted: 0,
      radioLogRemarks: 'Overhead join 2000ft, final rwy 27, vacated to Grass G1.',
      feeCalculatedGbp: 274.5,
      paymentMethod: 'CARD_TERMINAL',
    },
  ];

  const customInvoices: AirfieldInvoice[] = [
    {
      id: `inv-${user.icao.toLowerCase()}-1002`,
      invoiceNumber: `INV-${user.icao.toUpperCase()}-1002`,
      date: new Date().toISOString().split('T')[0],
      callsign: 'N844GA',
      aircraftType: 'Cirrus SR22 G6',
      mtowKg: 1542,
      pilotName: 'Mark Sterling',
      pilotEmail: 'mark@sterling-holdings.co.uk',
      movementId: `mov-${user.icao.toLowerCase()}-102`,
      items: [
        { id: 'item-1', description: 'Visiting Landing Fee (1501-2000kg MTOW)', quantity: 1, unitPriceGbp: 38.0, amountGbp: 38.0 },
        { id: 'item-2', description: 'Overnight Grass Tie-down (1 Night)', quantity: 1, unitPriceGbp: 15.0, amountGbp: 15.0 },
        { id: 'item-3', description: 'AVGAS 100LL Uplift (110 Liters)', quantity: 110, unitPriceGbp: 2.15, amountGbp: 236.5 },
      ],
      subtotalGbp: 289.5,
      vatGbp: 57.9,
      totalGbp: 347.4,
      status: 'PAID',
      paymentDate: new Date().toISOString().split('T')[0],
    },
  ];

  return {
    version: '2.0.0',
    lastUpdated: new Date().toISOString(),
    activeAirfieldId: customProfile.id,
    airfieldProfile: customProfile,
    customProfiles: [customProfile],
    runways: customRunways,
    parkingBays: customBays,
    fuelTanks: customFuelTanks,
    movements: customMovements,
    atsuLogs: customAtsuLogs,
    invoices: customInvoices,
    weather: {
      ...INITIAL_WEATHER,
      activeRunway: '27',
    },
  };
}

/**
 * Loads the isolated database for a specific user.
 * Guarantees zero cross-contamination between users.
 */
export function loadUserDatabase(userId: string): AerodromeDatabaseState {
  if (typeof window === 'undefined') {
    const user = getRegisteredUsers().find((u) => u.id === userId) || DEFAULT_USERS[0];
    return createInitialUserDatabase(user);
  }

  const tenantKey = getUserTenantStorageKey(userId);
  try {
    const raw = localStorage.getItem(tenantKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.airfieldProfile && parsed.movements) {
        return parsed;
      }
    }
  } catch (err) {
    console.error(`Failed to load database for user ${userId}:`, err);
  }

  // Not found or corrupted: initialize isolated seed and save
  const user = getRegisteredUsers().find((u) => u.id === userId) || DEFAULT_USERS[0];
  const freshDb = createInitialUserDatabase(user);
  saveUserDatabase(userId, freshDb);
  return freshDb;
}

/**
 * Saves a state specifically into the user's isolated partition
 */
export function saveUserDatabase(userId: string, state: AerodromeDatabaseState): boolean {
  if (typeof window === 'undefined') return false;
  const tenantKey = getUserTenantStorageKey(userId);
  try {
    const stateToSave = {
      ...state,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(tenantKey, JSON.stringify(stateToSave));
    return true;
  } catch (err) {
    console.error(`Failed to save database for user ${userId}:`, err);
    return false;
  }
}

/**
 * Authenticate by User ID (used for rapid persona switcher & token restoration)
 */
export function loginAsUser(userId: string): AuthSession | null {
  const users = getRegisteredUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) return null;

  const org = DEFAULT_ORGANIZATIONS[user.organizationId] || {
    id: user.organizationId,
    name: `${user.airfieldName} Operators`,
    icao: user.icao,
    location: 'United Kingdom Airspace',
    tier: 'LICENSED',
    primaryRadio: '122.805 MHz',
    ownerUserId: user.id,
    createdAt: user.createdAt,
  };

  const session: AuthSession = {
    user,
    organization: org,
    token: `tok_${user.id}_${Date.now()}`,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };

  saveCurrentSession(session);
  return session;
}

/**
 * Authenticate by email
 */
export function loginWithEmail(email: string): AuthSession | null {
  const users = getRegisteredUsers();
  const user = users.find((u) => u.email.toLowerCase().trim() === email.toLowerCase().trim());
  if (!user) return null;
  return loginAsUser(user.id);
}

/**
 * Registers a brand new isolated operator & airfield
 */
export function registerNewOperator(params: {
  name: string;
  email: string;
  airfieldName: string;
  icao: string;
  role: UserRole;
  tier?: 'STRIP' | 'LICENSED' | 'REGIONAL';
}): AuthSession {
  const users = getRegisteredUsers();

  const cleanIcao = (params.icao || 'EGXX').toUpperCase().trim().slice(0, 4);
  const newUserId = `usr_${cleanIcao.toLowerCase()}_${Date.now()}`;
  const newOrgId = `org_${cleanIcao.toLowerCase()}_${Date.now()}`;

  const colors = ['#18181b', '#27272a', '#3f3f46', '#09090b', '#1e293b'];
  const avatarColor = colors[users.length % colors.length];

  const newUser: SaaSUser = {
    id: newUserId,
    email: params.email.trim(),
    name: params.name.trim(),
    title: params.role === 'AIRFIELD_MANAGER' ? 'Aerodrome General Manager' : 'Duty Controller & Operations',
    role: params.role,
    organizationId: newOrgId,
    airfieldName: params.airfieldName.trim(),
    icao: cleanIcao,
    avatarColor,
    createdAt: new Date().toISOString(),
  };

  const newOrg: SaaSOrganization = {
    id: newOrgId,
    name: `${params.airfieldName} Operators`,
    icao: cleanIcao,
    location: 'United Kingdom Airspace',
    tier: params.tier || 'LICENSED',
    primaryRadio: '122.805 MHz',
    ownerUserId: newUserId,
    createdAt: new Date().toISOString(),
  };

  // Persist new user in registry
  const updatedUsers = [...users, newUser];
  if (typeof window !== 'undefined') {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
  }

  // Pre-seed isolated database partition for this new tenant
  const isolatedDb = createInitialUserDatabase(newUser);
  saveUserDatabase(newUserId, isolatedDb);

  // Establish session
  const session: AuthSession = {
    user: newUser,
    organization: newOrg,
    token: `tok_${newUserId}_${Date.now()}`,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };

  saveCurrentSession(session);
  return session;
}

/**
 * Gets currently active session or null
 */
export function getCurrentSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CURRENT_SESSION_KEY);
    if (!raw) {
      // Default to first user on cold start
      const defaultUser = getRegisteredUsers()[0];
      return loginAsUser(defaultUser.id);
    }
    const parsed = JSON.parse(raw) as AuthSession;
    if (parsed?.user?.id) {
      return parsed;
    }
    return null;
  } catch (err) {
    console.error('Failed to read session:', err);
    return null;
  }
}

/**
 * Persists or clears active session
 */
export function saveCurrentSession(session: AuthSession | null) {
  if (typeof window === 'undefined') return;
  if (!session) {
    localStorage.removeItem(CURRENT_SESSION_KEY);
  } else {
    localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(session));
  }
}

/**
 * Logout
 */
export function logoutSaaS(): void {
  saveCurrentSession(null);
}
